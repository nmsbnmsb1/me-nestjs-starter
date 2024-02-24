import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import { Sequelize, ModelCtor, Model, getAttributes } from 'sequelize-typescript';
import * as CDB from 'me-cache-db';

export type DB = string | Sequelize;
export type RepoOptions = { db: DB; tbn: string; tmodel: ModelCtor };
export type RepoOptionsTbnLike = { db: DB; tbn?: string; tbnLike?: string; tmodel: ModelCtor };
export type Repo = ModelCtor;
export type RepoData = {
	db: Sequelize;
	dbn: string;
	tbn: string;
	tbnAlias: string;
	tmodel: ModelCtor;
	repo: Repo;
	rid: string;
};

@Injectable()
export class DBService {
	constructor(private moduleRef: ModuleRef) {}

	//获取一个数据库连接
	public getDBConnection(db: DB) {
		return typeof db !== 'string' ? db : this.moduleRef.get(getConnectionToken(db), { strict: false });
	}
	public isRepo(r: Repo | Partial<RepoOptions>) {
		return typeof r === 'function';
	}
	public getTbnAlias(tbn: string) {
		let index = tbn.indexOf(':');
		return index < 0 ? tbn : tbn.substring(index + 1);
	}
	public async getRepoByOptions({ db, tbn, tmodel }: RepoOptions) {
		let sequelize = this.getDBConnection(db);
		if (!sequelize.isDefined(tbn)) {
			await sequelize
				.define(tbn, getAttributes(tmodel.prototype || tmodel), { tableName: tbn, timestamps: true, paranoid: true })
				.sync();
		}
		//
		let repo: any = sequelize.models[tbn];
		if (!repo.$options)
			repo.$options = {
				db: sequelize,
				dbn: sequelize.getDatabaseName(),
				tbn,
				tbnAlias: this.getTbnAlias(tbn),
				tmodel,
				repo,
				rid: `${sequelize.getDatabaseName()}.${tbn}`,
			};
		return repo as Repo;
	}
	public getRepoData(r: Repo | Model | RepoOptions | any): any {
		if (r.$options) return r.$options;
		//
		if (r instanceof Model) {
			let options: any = {};
			options.db = r.sequelize;
			options.dbn = r.sequelize.getDatabaseName();
			options.tbn = (r.constructor as any).getTableName();
			options.tbnAlias = this.getTbnAlias(options.tbn);
			options.tmodel = r.constructor;
			options.repo = r.constructor;
			options.rid = `${options.dbn}.${options.tbn}`;
			return ((r as any).$options = options);
		}
		if (typeof r === 'function') {
			let options: any = {};
			options.db = r.sequelize;
			options.dbn = r.sequelize.getDatabaseName();
			options.tbn = r.getTableName();
			options.tbnAlias = this.getTbnAlias(options.tbn);
			options.tmodel = r;
			options.repo = r;
			options.rid = `${options.dbn}.${options.tbn}`;
			return (r.$options = options);
		}

		//
		let sequelize = this.getDBConnection(r.db);
		let dbn = sequelize.getDatabaseName();
		let tbn = r.tbn;
		if (sequelize.isDefined(tbn)) {
			let options: any = { db: sequelize, dbn, tbn };
			options.tbnAlias = this.getTbnAlias(tbn);
			options.tmodel = r.tmodel;
			options.repo = sequelize.models[options.tbn];
			options.rid = `${options.dbn}.${options.tbn}`;
			return ((r as any).$options = options);
		}
		//
		return this.getRepoByOptions(r).then((repo) => (repo as any).$options);
	}
	//db
	public async showTables(db: DB, tbnLike?: string): Promise<{ name: string }[]> {
		let sequelize = this.getDBConnection(db);
		if (sequelize.getDialect() === 'sqlite') {
			return sequelize.query(
				`SELECT name FROM sqlite_master WHERE type='table' ${!tbnLike ? '' : `and name like '${tbnLike}'`};`,
				{ type: QueryTypes.SELECT }
			);
		}
		return [];
	}
	public async dbGetInTables(r: Repo | RepoOptionsTbnLike, query: (repo: Repo) => Promise<any>) {
		let repo: Repo;
		let data: CDB.IData | CDB.IData[];
		//
		if (this.isRepo(r)) {
			repo = r as Repo;
			data = await query(repo);
		} else {
			//遍历所有的表
			let { db, tbn, tbnLike } = r as RepoOptionsTbnLike;
			if (tbn) {
				repo = await this.getRepoByOptions(r as RepoOptions);
				data = await query(repo);
			} else {
				for (let t of await this.showTables(this.getDBConnection(db), tbnLike)) {
					(r as RepoOptions).tbn = t.name;
					//
					let tr = await this.getRepoByOptions(r as RepoOptions);
					let td = await query(tr);
					if (td) {
						repo = tr;
						data = td;
						break;
					}
				}
			}
		}
		return data;
	}
	public async dbBulkCreate(
		r: Repo,
		data: any | any[],
		updateFields?: string | string[] | { exclude: string | string[] },
		conflictFields?: string | string[]
	) {
		let datas = !Array.isArray(data) ? [data] : (data as any);
		if (typeof updateFields === 'string') {
			updateFields = updateFields.split(',');
		} else if ((updateFields as any)?.exclude) {
			let { exclude } = updateFields as any;
			if (typeof exclude === 'string') exclude = exclude.split(',');
			updateFields = [];
			for (let d of datas) {
				for (let k in d) {
					if (updateFields.indexOf(k) < 0 && exclude.indexOf(k) < 0) {
						updateFields.push(k);
					}
				}
			}
		}
		if (typeof conflictFields === 'string') {
			conflictFields = conflictFields.split(',');
		}
		let dbData = await r.bulkCreate(datas, {
			ignoreDuplicates: true,
			updateOnDuplicate: updateFields as string[],
			conflictAttributes: conflictFields as string[],
		});
		return !Array.isArray(data) ? dbData[0] : dbData;
	}
}
