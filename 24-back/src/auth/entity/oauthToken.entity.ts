import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('OauthToken')
export class OauthTokenEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column()
  user_id: number;

  @Column()
  access_token: string;
}