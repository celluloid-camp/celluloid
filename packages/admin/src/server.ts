import AdminJSExpress from "@adminjs/express";
import importExportFeature from "@adminjs/import-export";
import { Database, getModelByName, Resource } from '@adminjs/prisma';
import { dark, light, noSidebar } from '@adminjs/themes'
import PrismaModule from '@celluloid/database';
import AdminJS, { AdminJSOptions, DEFAULT_PATHS, ThemeConfig } from "adminjs";

import { componentLoader, Components } from './components.js'

const prisma = new PrismaModule.PrismaClient();

export const overrides: ThemeConfig['overrides'] = {
  colors: {
    primary100: '#557CFF',
    // bg: '#151419',
    // border: '#39383d',
    // text: '#fff',
    // container: '#1A1A1E',
    // sidebar: '#0C0B10',
    // grey100: '#CDCBD4',
    // grey60: '#8C8B90',
    // grey40: '#151419',
    // filterBg: '#1A1A1E',
    // inputBorder: 'rgba(145, 158, 171, 0.32)',
    // errorLight: '#C20012',
    // successLight: '#007D7F',
    // warningLight: '#A14F17',
    // infoLight: '#3040D6',
  },
  borders: {
    // default: '1px solid #232228',
    // input: '1px solid #232228',
  },
  // shadows: {
  //   login: '0 15px 24px 0 rgba(0, 0, 0, 0.3)',
  //   cardHover: '0 4px 12px 0 rgba(0, 0, 0, 0.3)',
  //   drawer: '-2px 0 8px 0 rgba(0, 0, 0, 0.3)',
  //   card: '0 1px 6px 0 rgba(0, 0, 0, 0.3)',
  // },
  //@ts-ignore
  font: '\'lexendregular\', sans-serif'
};



const getAdminRouter = (options: Partial<AdminJSOptions> = {}) => {


  AdminJS.registerAdapter({
    Resource: Resource,
    Database: Database,
  });


  const adminOptions = {
    branding: {
      companyName: 'Celluloid',
      withMadeWithLove: false,
      logo: '/admin/assets/images/logo.svg',
      theme: overrides
    },
    assets: {
      styles: ['/admin/assets/styles/override.css'],
    },
    dashboard: {
      component: Components.MyInput,
    },
    defaultTheme: noSidebar.id,
    availableThemes: [dark, light, noSidebar],
    componentLoader,
    resources: [
      {
        resource: { model: getModelByName('User', PrismaModule), client: prisma },
        options: {
          navigation: {
            name: 'Users',
            icon: 'User',
          },
          listProperties: ['email', 'username', 'role', 'code', 'confirmed'],
          filterProperties: ['email', 'username',],
          editProperties: ['username', 'confirmed', 'role'],
          actions: {
            new: {
              isAccessible: false,
              isVisible: false,
            },
          },
        }
      },
      {
        resource: { model: getModelByName('Project', PrismaModule), client: prisma },
        options: {
          navigation: {
            name: 'Projects',
            icon: 'Play',
          },
          listProperties: ['title', 'description', 'public', 'shared', 'publishedAt', 'user'],
          filterProperties: ['title', 'description', 'user'],
          editProperties: ['title', 'description', 'public', 'shared'],
          actions: {
            new: {
              isAccessible: false,
              isVisible: false,
            },
          },
          properties: {
            description: {
              type: 'textarea',
              props: {
                rows: 10,
              },
            },
          },
        },
      },
      {
        resource: { model: getModelByName('Playlist', PrismaModule), client: prisma },
        options: {
          navigation: {
            name: 'Playlists',
            icon: 'Play',
          },
          listProperties: ['title', 'description', 'user'],
          filterProperties: ['title', 'description', 'user'],
          editProperties: ['title', 'description'],
          actions: {
            new: {
              isAccessible: false,
              isVisible: false,
            },
          },
          properties: {
            description: {
              type: 'textarea',
              props: {
                rows: 10,
              },
            },
          },
        },
      },
      {
        resource: { model: getModelByName('Annotation', PrismaModule), client: prisma },
        options: {
          navigation: "Projects",
          listProperties: ['project', 'text', 'createdAt', 'user'],
          filterProperties: ['project', 'user'],
          editProperties: ['text', "pause"],
          actions: {
            new: {
              isAccessible: false,
              isVisible: false,
            },
          },
          properties: {
            text: {
              type: 'textarea',
              props: {
                rows: 10,
              },
            },
          },
        },
        features: [
          importExportFeature({
            componentLoader,
          }),
        ],
      },
      {
        resource: { model: getModelByName('Comment', PrismaModule), client: prisma },
        options: {
          navigation: "Projects",
          listProperties: ['annotation', 'text', 'createdAt', 'user'],
          filterProperties: ['user', 'annotation'],
          editProperties: ['text'],
          actions: {
            new: {
              isAccessible: false,
              isVisible: false,
            },
          },
          properties: {
            text: {
              type: 'textarea',
              props: {
                rows: 10,
              },
            },
          },
        }
      },
    ],
    ...options
  };


  const admin = new AdminJS(adminOptions);
  if (process.env.NODE_ENV == "developement")
    admin.watch()
  return AdminJSExpress.buildRouter(admin);
};

export default getAdminRouter;
