export interface INotice {
    id: string,
    title: string,
    type: 'SYSTEM' | 'ORDER' | 'EVENT' | 'MESSAGE' | 'AUCTION',
    createdAt: string,
    order: {
        shopOrderId: number
    }

    linkObj: {
        path: string
    }
    product: {
        id: number,
        name: string,
        state: string
    }
    readAt: string,
    content: string,
}

export interface IResNotification {
    notifications: INotice[]
    totalNew: number
    message?: string
}
