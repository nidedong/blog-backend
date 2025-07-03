export interface IBaseInfo {
  id: string;
  createBy: string;
  createdAt: Date;
  updateBy: string;
  updateAt?: Date;
  deleteAt?: Date;
}
