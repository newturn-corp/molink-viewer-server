import { PageVisibility } from '@newturn-develop/types-molink'

export const pageVisibilityToNumber = (visibility: PageVisibility) => {
    switch (visibility) {
    case PageVisibility.Public:
        return 2
    case PageVisibility.OnlyFollower:
        return 1
    case PageVisibility.Private:
        return 0
    }
}
