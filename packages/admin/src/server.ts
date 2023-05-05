import AdminJSExpress from "@adminjs/express";
import * as AdminJSPrisma from "@adminjs/prisma";
import { dark, light, noSidebar } from '@adminjs/themes'
import { DMMFClass, prisma } from "@celluloid/database";
import AdminJS, { AdminJSOptions, DEFAULT_PATHS, ThemeConfig } from "adminjs";

import { componentLoader, Components } from './components.js'


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
    Resource: AdminJSPrisma.Resource,
    Database: AdminJSPrisma.Database,
  });


  const dmmf = (prisma as any)._baseDmmf as DMMFClass;
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
        resource: { model: dmmf.modelMap.User, client: prisma },
        options: {
          navigation: {
            name: 'Users',
            icon: 'User',
          },
          listProperties: ['id', 'email', 'username', 'role', 'code', 'confirmed'],
          filterProperties: ['email', 'username', 'role'],
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
        resource: { model: dmmf.modelMap.Project, client: prisma },
        options: {
          navigation: {
            name: 'Projects',
            icon: 'Play',
          },
          listProperties: ['title', 'description', 'public', 'shared', 'publishedAt'],
          filterProperties: ['title', 'description', 'publishedAt'],
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
        resource: { model: dmmf.modelMap.Annotation, client: prisma },
        options: {
          navigation: "Projects",
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
        resource: { model: dmmf.modelMap.Comment, client: prisma },
        options: {
          navigation: "Projects",
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
