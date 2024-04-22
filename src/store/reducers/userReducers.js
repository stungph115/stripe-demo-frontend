const initialState = {
    email: null,
    firstname: null,
    lastname: null,
    codeClient: null
}

const userReducer = (state = initialState, action) => {

    switch (action.type) {
        case 'USER_SAVE':
            return {
                ...state,

                email: action.data.email,
                firstname: action.data.firstname,
                lastname: action.data.lastname,
                codeClient: action.data.codeClient
            }
        case 'USER_REMOVE':
            return {
                ...state,
                email: null,
                firstname: null,
                lastname: null,
                codeClient: null
            }
        default:
            return state
    }

}

export default userReducer
