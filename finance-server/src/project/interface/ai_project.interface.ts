import { ProjectType } from '../ai_project.model';

export interface IAIProject {
  id: string;
  user_id: number;
  title: string;
  type: ProjectType;
}
