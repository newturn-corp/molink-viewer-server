import { PageVisibility } from '@newturn-develop/types-molink'

export const numberToPageVisibility = (visibilityNumber: number) => {
    switch (visibilityNumber) {
    case 2:
        return PageVisibility.Public
    case 1:
        return PageVisibility.OnlyFollower
    case 0:
        return PageVisibility.Private
    }
}
