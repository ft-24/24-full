import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('MatchHistory')
export class MatchHistoryEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column()
  user_id: number;

  @Column()
  opponent_id: number;

  @Column()
  user_score: number;

  @Column()
  opponent_score: number;

  @Column({ default: "global" })
  mode: string;

  @CreateDateColumn()
  playedAt: Date;
}