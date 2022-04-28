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
    url: '',
    profile: 'Profile 1',
    workspace: 'Workspace 1',
    attachments: [],
  },
  {
    id: 2,
    title: 'Document 2',
    profile: 'Profile 1',
    url: '',
    workspace: 'Workspace 1',
    attachments: [
      {
        id: 100,
        title: 'Attachment 1',
        url: '',
      },
      {
        id: 101,
        title: 'Attachment 2',
        url: '',
      },
    ],
  },
  {
    id: 3,
    title: 'Document 3',
    url: '',
    profile: 'Profile 4',
    workspace: 'Workspace 2',
    attachments: [
      {
        id: 102,
        title: 'Attachment 3',
        url: '',
      },
      {
        id: 103,
        title: 'Attachment 4',
        url: '',
      },
    ],
  },
  {
    id: 4,
    title: 'Document 4',
    url: '',
    profile: 'Profile 6',
    workspace: 'Workspace 3',
    attachments: [
      {
        id: 104,
        title: 'Attachment 5',
        url: '',
      },
    ],
  },
];
