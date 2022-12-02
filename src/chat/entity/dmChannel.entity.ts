import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('dmChannel')
export class DmChannelEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;
	
	@Column()
	room: string;

	@Column()
	user_id: number;
};