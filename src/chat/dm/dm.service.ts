import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/entity/user.entity";
import { Repository } from "typeorm";
import { DmListEntity } from "../entity/dmList.entity";

@Injectable()
export class DMService {
	constructor(
		@InjectRepository(DmListEntity) private dmListRepository: Repository<DmListEntity>,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
	){}

	async getDMList(user) {
		const ret = []
		let tmp = await this.dmListRepository.findBy({user1_id: user.id})
		for (let ind in tmp) {
			ret.push(await this.userRepository.findOneBy({id: tmp[ind].user2_id}));
		}

		tmp = await this.dmListRepository.findBy({user2_id: user.id})
		for (let ind in tmp) {
			ret.push(await this.userRepository.findOneBy({id: tmp[ind].user1_id}));
		}
		return ret;
	}
}