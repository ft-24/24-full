import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('GameResult')
export class GameResultEntity {
  @PrimaryGeneratedColumn('rowid')
	id: number;

  @Column()
  user1_id: number;

  @Column()
  user2_id: number;

  @Column()
  win: number;

  @Column()
  user1_score: number;

  @Column()
  user2_score: number;
}