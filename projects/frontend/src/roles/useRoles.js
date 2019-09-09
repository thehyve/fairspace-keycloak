import KeycloakAPI from "../common/services/KeycloakAPI";
import useAsync from "../common/hooks/UseAsync";
import {useCallback} from "react";
import {getRoleName, hasError, isLoading, roles} from "./roleUtils";

const combineRoleLists = calls => {
    if(hasError(calls) || isLoading(calls)) return {};

    return Object.fromEntries(
        roles.map(role => [role, calls[role].data])
    );
};

/**
 * This hook will load information for all roles regarding the given workspace
 *
 * It will return an object, where each key is a role ('user', 'coordinator'), and each
 * value is the keycloak object describing that role for the current workspace.
 *
 * Keycloak provides the id and name of the role, which should be used for providing
 * users or groups with the role.
 *
 * If any of the calls has an error, the returned error value will be true
 * If any of the calls is still loading, the returned loading value will be true
 * *
 * @param workspace Workspace name
 * @returns {{roles: {}, error, loading}}
 */
export const useRoles = workspace => {
    const calls = {};

    roles.forEach(role => {
        const roleName = getRoleName(role, workspace);

        // We use a hook inside a loop, which is discouraged. However, as we use
        // a fixed array, the calls will always be made in the same order
        // eslint-disable-next-line react-hooks/rules-of-hooks
        calls[role] = useAsync(useCallback(() => KeycloakAPI.getRole(roleName), [roleName]));
    });

    return {
        error: hasError(calls),
        loading: isLoading(calls),
        roles: combineRoleLists(calls)
    }
}
