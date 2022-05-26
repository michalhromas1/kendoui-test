import { deepCopy } from '../helpers';

export type Workspace = {
  id: number;
  title: string;
};

export type Profile = {
  id: number;
  workspaceId: number;
  title: string;
};

export type AppDocument = AppDocumentFile & {
  profile: string;
  workspace: string;
  attachments: AppDocumentFile[];
};

export type AppDocumentFile = {
  id: number;
  title: string;
  url: string;
};

export type WorkspaceProfileRelationship = Workspace & {
  profiles: Profile[];
};

export const getWorkspaceProfileRelationships =
  (): WorkspaceProfileRelationship[] => {
    const workspaces = getWorkspaces();
    const profiles = getProfiles();

    return workspaces.map((w) => ({
      ...w,
      profiles: profiles.filter((p) => p.workspaceId === w.id),
    }));
  };

export const getWorkspaces = (): Workspace[] => {
  return deepCopy(WORKSPACES);
};

export const getProfiles = (): Profile[] => {
  return deepCopy(PROFILES);
};

export const getDocuments = (): AppDocument[] => {
  return deepCopy(DOCUMENTS);
};

const WORKSPACES: Workspace[] = [
  {
    id: 1,
    title: 'Workspace 1',
  },
  {
    id: 2,
    title: 'Workspace 2',
  },
  {
    id: 3,
    title: 'Workspace 3',
  },
];

const PROFILES: Profile[] = [
  {
    id: 1,
    workspaceId: 1,
    title: 'Profile 1',
  },
  {
    id: 2,
    workspaceId: 1,
    title: 'Profile 2',
  },
  {
    id: 3,
    workspaceId: 2,
    title: 'Profile 3',
  },
  {
    id: 4,
    workspaceId: 2,
    title: 'Profile 4',
  },
  {
    id: 5,
    workspaceId: 2,
    title: 'Profile 5',
  },
  {
    id: 6,
    workspaceId: 3,
    title: 'Profile 6',
  },
];

const DOCUMENTS: AppDocument[] = [
  {
    id: 1,
    title: 'Document 1',
    url: 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    profile: 'Profile 1',
    workspace: 'Workspace 1',
    attachments: [],
  },
  {
    id: 2,
    title: 'Document 2',
    profile: 'Profile 1',
    url: 'https://images.unsplash.com/photo-1523897056079-5553b57112d4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8M3x8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    workspace: 'Workspace 1',
    attachments: [
      {
        id: 100,
        title: 'Attachment 1',
        url: 'https://images.unsplash.com/photo-1506057213367-028a17ec52e5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
      },
      {
        id: 101,
        title: 'Attachment 2',
        url: 'https://images.unsplash.com/photo-1503965830912-6d7b07921cd1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Nnx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
      },
    ],
  },
  {
    id: 3,
    title: 'Document 3',
    url: 'https://images.unsplash.com/photo-1449867727329-3294ea016353?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8NHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    profile: 'Profile 4',
    workspace: 'Workspace 2',
    attachments: [
      {
        id: 102,
        title: 'Attachment 3',
        url: 'https://images.unsplash.com/photo-1457270508644-1e4905fabd7e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8OHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
      },
      {
        id: 103,
        title: 'Attachment 4',
        url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTR8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
      },
    ],
  },
  {
    id: 4,
    title: 'Document 4',
    url: 'https://images.unsplash.com/photo-1435224654926-ecc9f7fa028c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8OXx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    profile: 'Profile 6',
    workspace: 'Workspace 3',
    attachments: [
      {
        id: 104,
        title: 'Attachment 5',
        url: 'https://images.unsplash.com/photo-1475776408506-9a5371e7a068?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTN8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
      },
    ],
  },
];
