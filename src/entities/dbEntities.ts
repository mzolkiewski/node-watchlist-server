import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { IShow, IEpisode, IUser } from './interfaces';
import { ShowType, UserRole } from './enums';

@Entity()
export class Show implements IShow {
  @PrimaryGeneratedColumn()
  public showId: number;

  @Column({
    type: 'varchar',
    length: '120',
    unique: true,
  })
  public slug: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  public title: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'also known as',
  })
  public aka: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  public type: ShowType;

  @Column({
    type: 'tinyint',
  })
  public recurring: boolean;

  @OneToMany(type => Episode, episode => episode.show, {
    cascadeInsert: true,
    cascadeUpdate: true,

  })
  public episodes: Episode[];

  @ManyToMany(type => User, user => user.shows)
  public users: User[];
}

@Entity()
export class Episode implements IEpisode {
  @PrimaryGeneratedColumn()
  public episodeId: number;

  @Index()
  @Column({
    type: 'tinyint',
  })
  public season: number;

  @Index()
  @Column({
    type: 'smallint',
  })
  public episode: number;

  // 'timestamp' resulted in the hh:mm:ss being persisted incorrectly sometimes
  // probably an issue with typeorm
  @Index()
  @Column({
    type: 'bigint',
    transformer: {
      to: dateString => new Date(dateString).valueOf(),
      from: value => new Date(value),
    },
  })
  public premiereDate: Date;

  @ManyToOne(type => Show, show => show.episodes, {
    cascadeAll: true,
    onDelete: 'CASCADE',
  })
  public show: Show;

  @ManyToMany(type => User, user => user.episodes)
  public users: User[];
}

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn()
  public userId: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  public email: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  public role: UserRole;

  @ManyToMany(type => Show, show => show.users)
  @JoinTable()
  public shows: Show[];

  @ManyToMany(type => Episode, episode => episode.users)
  @JoinTable()
  public episodes: Episode[];
}
