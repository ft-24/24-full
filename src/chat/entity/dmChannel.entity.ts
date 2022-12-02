import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('dmChannel')
export class DmChannelEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	user_id: number;

	@Column()
	room: string;
};