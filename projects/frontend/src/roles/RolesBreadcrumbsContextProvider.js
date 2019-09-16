import React from "react";
import BreadcrumbsContext from "../common/contexts/BreadcrumbsContext";

export default ({workspaceId, children}) => (
    <BreadcrumbsContext.Provider value={{
        segments: [
            {
                label: 'Workspaces',
                icon: 'folder_open',
                href: '/workspaces'
            },
            {
                label: workspaceId,
                href: '/workspaces/' + workspaceId
            },
            {
                label: 'roles',
                href: '/workspaces/' + workspaceId + '/roles'
            },
        ]
    }}
    >
        {children}
    </BreadcrumbsContext.Provider>
);
