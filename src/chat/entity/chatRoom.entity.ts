import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('ChatRoom')
export class ChatRoomEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	owner_id: number;

	@Column()
	name: string;

	@Column()
	access_modifier: string;

	@Column()
	password: string;

	@Column()
	create_date: Date;

	@Column()
	update_date: Date;
};