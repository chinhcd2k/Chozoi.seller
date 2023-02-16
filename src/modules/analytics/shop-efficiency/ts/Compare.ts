export const getGrowth = (src: number, desc: number): boolean => {
    return src >= desc;
};

export const getGrowthValue = (src: number, desc: number): number => {
    return ((src - desc) / desc) * 100;
};