import AdminJSExpress from "@adminjs/express";
import { Database, getModelByName, Resource } from '@adminjs/prisma';
import { dark, light, noSidebar } from '@adminjs/themes'
import PrismaModule, { prisma } from '@celluloid/prisma';
import AdminJS, { type ThemeConfig } from "adminjs";

// @ts-expect-error
BigInt.prototype.toJSON = function () { const int = Number.parseInt(this.toString()); return int ?? this.toString() };

import { ComponentLoader } from 'adminjs'

const componentLoader = new ComponentLoader()

const Components = {
  Dashboard: componentLoader.add('Dashboard', './dashboard'),
  // other custom components
}

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



const getAdminRouter = () => {


  AdminJS.registerAdapter({
    Resource: Resource,
    Database: Database,
  });

  const admin = new AdminJS({
    rootPath: "/admin",
    branding: {
      companyName: 'Celluloid',
      withMadeWithLove: false,
      logo: '/images/logo-admin.svg',
      theme: overrides
    },
    assets: {
      styles: ['/styles/override.css'],
    },
    defaultTheme: noSidebar.id,
    availableThemes: [dark, light, noSidebar],
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
          listProperties: ['title', 'description', 'public', 'shared', 'publishedAt', 'user', 'duration', 'thumbnailURL', 'metadata'],
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
          navigation: "Projects",
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
        resource: { model: getModelByName('Chapter', PrismaModule), client: prisma },
        options: {
          navigation: "Projects",
          listProperties: ['title', 'description', 'project', 'thumbnail', 'startTime', 'endTime'],
          filterProperties: ['title', 'description', 'project'],
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
        }
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
      {
        resource: { model: getModelByName('Storage', PrismaModule), client: prisma },
        options: {
          navigation: "Storage",
          actions: {
            new: {
              isAccessible: false,
              isVisible: false,
            },
            edit: {
              isAccessible: false,
              isVisible: false,
            }
          },
        }
      },
      {
        resource: { model: getModelByName('QueueJob', PrismaModule), client: prisma },
        options: {
          navigation: "Job",
          actions: {
            new: {
              isAccessible: false,
              isVisible: false,
            },
            edit: {
              isAccessible: false,
              isVisible: false,
            }
          },
        },

      }
    ],
    dashboard: {
      component: Components.Dashboard,
    },
    componentLoader,
  });
  if (process.env.NODE_ENV === "developement")
    admin.watch()
  return AdminJSExpress.buildRouter(admin);
};

export default getAdminRouter;
