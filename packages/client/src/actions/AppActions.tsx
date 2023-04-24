import { ActionType, createEmptyAction } from "~types/ActionTypes";

export const applicationUpdated = () =>
  createEmptyAction(ActionType.APPLICATION_UPDATED);
