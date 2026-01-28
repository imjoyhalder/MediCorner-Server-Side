
import { prisma } from "../../lib/prisma";

// model Medicine {
//   id           String  @id @default(uuid())
//   name         String
//   brandName    String
//   genericName  String?
//   manufacturer String?
//   description  String?
//   isOtc        Boolean @default(true)
//   thumbnail    String?

//   categoryId String
//   category   MedicineCategory @relation(fields: [categoryId], references: [id])

//   sellers SellerMedicine[]
//   reviews Review[]
// }

const createMedicine = async (payload: {
    name: string
    brandName: string
    genericName?: string
    manufacturer?: string
    description?: string
    isOtc?: boolean
    thumbnail?: string
    categoryId: string
}) => {
    const res = await prisma.medicine.create({
        data: payload
    })
    return res
}


export const medicineServices = {
    createMedicine
}