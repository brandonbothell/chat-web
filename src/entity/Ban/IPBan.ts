import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class IPBan {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  ip: string

  @Column('varchar')
  reason: string

  @Column('varchar')
  dateBanned: string

  constructor (ban?: IPBan) {
    if (ban) {
      Object.assign(this, ban)
    }

    this.dateBanned = new Date().getTime().toString()
  }
}
