import {
  ProjectCreateData,
  ProjectGraphRecord,
  ProjectRecord,
  UserRecord,
} from "@celluloid/types";
import { Body, Controller, Get, Path, Post, Request, Res, Response, Route, SuccessResponse, Tags, TsoaResponse } from "tsoa";
import { Logger } from "../backends/Logger";

import * as ProjectStore from "../store/ProjectStore";

function fetchMembers(
  project: ProjectRecord,
  user?: Partial<UserRecord>
): Promise<UserRecord[]> {
  if (project.collaborative || (user && user.id === project.userId)) {
    return ProjectStore.selectProjectMembers(project.id);
  } else if (user) {
    return ProjectStore.isMember(project.id, user).then((member) =>
      member ? Promise.resolve([user] as UserRecord[]) : Promise.resolve([])
    );
  } else {
    return Promise.resolve([]);
  }
}



export interface User {
  id: string;
  username: string;
  email?: string;
}

export type ProjectUserParams = Pick<User, "id">;


export interface ProjectResult {
  tags:           string[];
  id:             string;
  videoId:        string;
  userId:         string;
  title:          string;
  description:    string;
  host:           string;
  assignments:    string[];
  publishedAt:    Date;
  objective:      string;
  levelStart:     number;
  levelEnd:       number;
  public:         boolean;
  collaborative:  boolean;
  shared:         boolean;
  shareName:      string;
  shareExpiresAt: Date;
  sharePassword:  string;
  extra:          Extra;
}

export interface Extra {
}


@Route("/api/projects")
export class ProjectController extends Controller {

  @Get("/")
  public async getProjects(
    @Request() req: any
  ): Promise<Array<ProjectGraphRecord>> {
    const projects = await ProjectStore.selectAll(req.user as UserRecord);

    //@ts-ignore
    return Promise.all(
      projects.map((project) =>
        fetchMembers(project, req.user).then((members: UserRecord[]) => ({
          ...project,
          members,
        }))
      )
    );
  }

  @SuccessResponse("201", "Created") 
  @Post("/")
  public async createProject(
    @Request() req: any,
    @Body() requestBody: ProjectCreateData,
    @Res() notFoundResponse: TsoaResponse<500, { reason: string }>
  ): Promise<ProjectResult> {
    try {
      const result = await ProjectStore.insert(
        requestBody,
        req.user as UserRecord
      );
      return result as ProjectResult;
    } catch (error) {
      Logger.error(error, `Failed to create project`);
      return notFoundResponse(500, { reason: "Failed to create project" });
    }
  }
}
