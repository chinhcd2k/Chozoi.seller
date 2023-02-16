import { IMetadata } from "../../index";

export interface IBenefit {
  id: number
  name: string
  type: "STANDARD" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND"
  benefits: {
    image: string
    title: string
  }[]
  current: boolean
  selected: boolean
}

export interface IResCheckIn {
  benefits: IBenefit[]
  continuousCheckIn: {
    day: number
    exp: number
    point: number
    status: boolean
  }[]
  currentCheckIn: {
    exp: number
    nextTime: number
    point: number
    status: boolean
  }
  ranking: {
    currentRankingExp: number
    currentRankingPoint: number
    nextRankingExp: number
    rankingName: string
    type: "STANDARD" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND"
    benefit: {
      id: number
    }
  }
  selectedBenefit: IBenefit
}

export interface ILogLoyalty {
  content: string
  createdAt: string
  exp: number
  point: number
}

export interface IResLoyalty {
  logs: ILogLoyalty[],
  metadata: IMetadata
}

export interface ILogCoin {
  content: string
  userId: number
  exp: number
  point: number
  action: string
  createdAt: string
  updatedAt: string
}

export interface IResHistoryCoin {
  logs: ILogCoin[],
  metadata: IMetadata
}
