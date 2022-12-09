import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('TFACode')
export class TFACodeEntity {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  user_id: number;

  @Column()
  code: string;
}