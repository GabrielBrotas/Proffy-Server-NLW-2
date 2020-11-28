export interface userDataProps {
    name?: string;
    email?: string;
    password?: string;
}

export function validateRegisterUser(userData: userDataProps) {

    let errors: userDataProps = {}

    if(userData.name === undefined || userData.name === null || userData.name === "") {
        errors.name = "Invalid user name"
    }

    if(userData.password === undefined || userData.password === null || userData.password === "") {
        errors.password = "Invalid user password"
    }
    
    if(userData.email === undefined || userData.email === null || userData.email === "") {
        errors.email = "Invalid user email"
    }

    return errors

}