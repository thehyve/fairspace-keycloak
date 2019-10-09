package io.fairspace.portal.services;

import com.google.common.util.concurrent.ListenableFuture;
import hapi.chart.ChartOuterClass;
import hapi.release.ReleaseOuterClass;
import hapi.release.StatusOuterClass;
import hapi.services.tiller.Tiller;
import hapi.services.tiller.Tiller.InstallReleaseRequest;
import io.fairspace.portal.model.ReleaseInfo;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.microbean.helm.ReleaseManager;

import java.io.IOException;
import java.util.Collection;
import java.util.Optional;
import java.util.concurrent.*;

import static java.lang.String.format;
import static java.lang.Thread.currentThread;
import static java.util.concurrent.TimeUnit.MILLISECONDS;

@Slf4j
public class ReleaseService {
    private static final long INSTALLATION_TIMEOUT_SEC = 900;

    private final ReleaseManager releaseManager;
    private CachedReleaseList releaseList;
    private final ScheduledExecutorService worker;

    public ReleaseService(
            @NonNull ReleaseManager releaseManager,
            @NonNull CachedReleaseList releaseList,
            @NonNull ScheduledExecutorService worker) {
        this.releaseManager = releaseManager;
        this.releaseList = releaseList;
        this.worker = worker;
    }

    public Collection<ReleaseOuterClass.Release> getReleases() {
        return releaseList.get();
    }

    public void invalidateCache() {
        releaseList.invalidateCache();
    }

    public Optional<ReleaseOuterClass.Release> getRelease(String releaseId) {
        return getReleases().stream().filter(release -> release.getName().equals(releaseId)).findFirst();
    }

    /**
     * Installs the specified release and invalidates the cache when finished
     * @param requestBuilder
     * @param chartBuilder
     * @throws IOException
     */
    public void installRelease(InstallReleaseRequest.Builder requestBuilder, ChartOuterClass.Chart.Builder chartBuilder) {
        requestBuilder
                .setTimeout(INSTALLATION_TIMEOUT_SEC)
                .setWait(true);
        log.info("Installing release {} with chart {} version {}", requestBuilder.getName(), chartBuilder.getMetadata().getName(), chartBuilder.getMetadata().getVersion());

        performWithCacheInvalidation("Helm install " + requestBuilder.getName(), () -> releaseManager.install(requestBuilder, chartBuilder));
    }

    /**
     * Upgrades the specified release and invalidates the cache when finished
     * @param requestBuilder
     * @param chartBuilder
     */
    public void updateRelease(Tiller.UpdateReleaseRequest.Builder requestBuilder, ChartOuterClass.Chart.Builder chartBuilder) {
        updateRelease(requestBuilder, chartBuilder, null, 0);
    }

    /**
     * Upgrades the specified release and invalidates the cache when finished and performs a post update action after delay
     * @param requestBuilder
     * @param chartBuilder
     * @param onPostUpdate
     * @param delayMs
     */
    public void updateRelease(Tiller.UpdateReleaseRequest.Builder requestBuilder, ChartOuterClass.Chart.Builder chartBuilder, Runnable onPostUpdate, long delayMs) {
        requestBuilder
                .setTimeout(INSTALLATION_TIMEOUT_SEC)
                .setWait(true);

        performWithCacheInvalidation(format("Helm upgrade release %s to version %s", requestBuilder.getName(), chartBuilder.getMetadata().getVersion()),
                () -> {
                   var future = (ListenableFuture) releaseManager.update(requestBuilder, chartBuilder);
                   if (onPostUpdate != null) {
                       future.addListener(() -> worker.schedule(onPostUpdate, delayMs, MILLISECONDS), Runnable::run);
                   }
                   return future;
                });
    }

    /**
     * Uninstall the specified release and invalidates the cache when finished
     * @param requestBuilder
     * @throws IOException
     */
    public void uninstallRelease(Tiller.UninstallReleaseRequest.Builder requestBuilder) {
        requestBuilder
                .setTimeout(INSTALLATION_TIMEOUT_SEC);

        // Perform uninstallation command by helm
        performWithCacheInvalidation("Helm uninstall " + requestBuilder.getName(), () -> releaseManager.uninstall(requestBuilder.build()));
    }

    public static ReleaseInfo getReleaseInfo(ReleaseOuterClass.Release release) {
        return ReleaseInfo.builder()
                .status(release.getInfo().getStatus().getCode().toString())
                .description(release.getInfo().getDescription())
                .ready(release.getInfo().getStatus().getCode() == StatusOuterClass.Status.Code.DEPLOYED)
                .build();
    }

    /**
     * Handles release list cache invalidation and error handling when a Helm command is executed and when it finishes
     * and ensures that no more than one command is executed at a time
     * @param commandDescription
     * @param action Action to performWithCacheInvalidation
     */
    private void performWithCacheInvalidation(String commandDescription, Callable<Future<?>> action) {
        worker.execute(() -> {
            try {
                log.info("Executing command {}", commandDescription);
                var future = action.call();
                releaseList.invalidateCache();
                future.get();
                log.info("Successfully executed command {}", commandDescription);
            } catch (InterruptedException e) {
                log.warn("Interrupted while performing command {}", commandDescription);
                currentThread().interrupt();
            } catch (Exception e) {
                log.error("Error performing command {}", commandDescription, e);
            } finally {
                releaseList.invalidateCache();
            }
        });
    }
}
