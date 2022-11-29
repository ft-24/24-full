import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('UserStats')
export class UserStatsEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column()
  user_id: number;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  loses: number;

  @Column({ default: 1500 })
  ladder_score: number;

  @Column("decimal", { default: 0 })
  arcade_score: number;
}