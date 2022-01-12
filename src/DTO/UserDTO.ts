import { FollowResult } from '../services/FollowService'

export class GetUserProfileDTO {
    userId: number
    email: string
    nickname: string
    representativeDocumentId: string | null
    profileImageUrl: string | null
    biography: string

    constructor (userId: number, email: string, nickname: string, representativeDocumentId: string | null, profileImageUrl: string | null, biography: string) {
        this.userId = userId
        this.email = email
        this.nickname = nickname
        this.representativeDocumentId = representativeDocumentId
        this.profileImageUrl = profileImageUrl
        this.biography = biography
    }
}

export class SaveSupportDTO {
    content: string

    constructor (content: string) {
        this.content = content
    }
}

export class SearchUserDTO {
    searchText: string

    constructor (searchText: string) {
        this.searchText = searchText
    }
}

export class UserSearchResultDTO {
    id: number
    nickname: string
    profileImageUrl: string | null
    biography: string
    isFollowing: boolean
    isFollowRequested: boolean

    constructor (id: number, nickname: string, profileImageUrl: string | null, biography: string, isFollowing: boolean, isFollowRequested: boolean) {
        this.id = id
        this.nickname = nickname
        this.profileImageUrl = profileImageUrl
        this.biography = biography
        this.isFollowing = isFollowing
        this.isFollowRequested = isFollowRequested
    }
}

export class SearchResponseDTO {
    userSearchResults: UserSearchResultDTO[]

    constructor (userSearchResults: UserSearchResultDTO[]) {
        this.userSearchResults = userSearchResults
    }
}

export class GetUserRepresentativeDocumentURLDTO {
    id: number

    constructor (id: number) {
        this.id = id
    }
}

export class GetUserRepresentativeDocumentResponseDTO {
    url: string

    constructor (url: string) {
        this.url = url
    }
}

export class SaveFriendRequestDTO {
    userId: number

    constructor (userId: number) {
        this.userId = userId
    }
}

export class UserWithProfileDTO {
    id: number
    nickname: string
    pwd: string
    pwd_salt: string
    email: string
    is_email_auth: boolean
    email_auth_at: Date
    login_attempt_count: number
    representative_document_id: string | null
    profile_image_url: string | null
    biography: string

    constructor (id: number, nickname: string, pwd: string, pwd_salt: string, email: string, is_email_auth: boolean, email_auth_at: Date, login_attempt_count: number, representative_document_id: string | null, profile_image_url: string | null, biography: string) {
        this.id = id
        this.nickname = nickname
        this.pwd = pwd
        this.pwd_salt = pwd_salt
        this.email = email
        this.is_email_auth = is_email_auth
        this.email_auth_at = email_auth_at
        this.login_attempt_count = login_attempt_count
        this.representative_document_id = representative_document_id
        this.profile_image_url = profile_image_url
        this.biography = biography
    }
}

export class UpdateUserBiographyDTO {
    biography: string

    constructor (biography: string) {
        this.biography = biography
    }
}

export class FollowResponseDTO {
    followResult: FollowResult

    constructor (followResult: FollowResult) {
        this.followResult = followResult
    }
}
