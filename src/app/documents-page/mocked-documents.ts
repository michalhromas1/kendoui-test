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

export type Document = DocumentFile & {
  id: number;
  file: string;
  profile: string;
  workspace: string;
  attachments: DocumentFile[];
};

export type DocumentFile = {
  id: number;
  file: string;
};

export const getWorkspaces = (): Workspace[] => {
  return deepCopy(WORKSPACES);
};

export const getProfiles = (): Profile[] => {
  return deepCopy(PROFILES);
};

export const getDocuments = (): Document[] => {
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

const DOCUMENTS: Document[] = [
  {
    id: 1,
    file: 'Document 1',
    profile: 'Profile 1',
    workspace: 'Workspace 1',
    attachments: [],
  },
  {
    id: 2,
    file: 'Document 2',
    profile: 'Profile 1',
    workspace: 'Workspace 1',
    attachments: [
      {
        id: 100,
        file: 'Attachment 1',
      },
      {
        id: 101,
        file: 'Attachment 2',
      },
    ],
  },
  {
    id: 3,
    file: 'Document 3',
    profile: 'Profile 4',
    workspace: 'Workspace 2',
    attachments: [
      {
        id: 102,
        file: 'Attachment 3',
      },
      {
        id: 103,
        file: 'Attachment 4',
      },
    ],
  },
  {
    id: 4,
    file: 'Document 4',
    profile: 'Profile 6',
    workspace: 'Workspace 3',
    attachments: [
      {
        id: 104,
        file: 'Attachment 5',
      },
    ],
  },
];
