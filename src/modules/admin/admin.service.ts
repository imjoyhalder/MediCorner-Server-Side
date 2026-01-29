
import { UserStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"


const getUsers = async()=>{
    return await prisma.user.findMany()
}

const banUser = async(userId: string)=>{
    const isExist = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if(!isExist){
        return {
            message: "user not found"
        }
    }
    
    const result = await prisma.user.update({
        where: {
            id: userId
        },
        data:{
            status: UserStatus.BAN
        }
    })
    return {
        message: `${isExist.id} number use ban successfully`, 
        result
    }
}

export const userServices = {
    getUsers, 
    banUser
}