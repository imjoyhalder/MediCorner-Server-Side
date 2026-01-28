import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { parseExpiryDate } from "../../helper/dateFormater";



interface AddMedicineWithInventoryPayload {
    name: string;
    brandName: string;
    genericName?: string;
    manufacturer?: string;
    description?: string;
    categoryId: string;

    price: number;
    stockQuantity?: number;
    batchNumber: string;
    expiryDate?: Date;
}


interface UpdateMedicinePayload {
    name?: string;
    brandName?: string;
    genericName?: string;
    manufacturer?: string;
    description?: string;

    price?: number;
    stockQuantity?: number;
    batchNumber?: string;
}



const addMedicineWithInventory = async (
    sellerId: string,
    payload: AddMedicineWithInventoryPayload
) => {
    return prisma.$transaction(async (tx) => {
        console.log(payload);
        const category = await tx.medicineCategory.findUnique({
            where: { id: payload.categoryId },
        });
        if (!category) throw new AppError(400, "Invalid categoryId");

        // 2. check medicine exists
        let medicine = await tx.medicine.findFirst({
            where: {
                name: payload.name,
                brandName: payload.brandName,
            },
        });

        // 3. if medicine not exists 
        if (!medicine) {
            medicine = await tx.medicine.create({
                data: {
                    name: payload.name,
                    brandName: payload.brandName,
                    genericName: payload.genericName,
                    manufacturer: payload.manufacturer,
                    description: payload.description,
                    categoryId: payload.categoryId,
                    isOtc: true,
                },
            });
        }

        // 4. prevent same seller duplicate
        const alreadyAdded = await tx.sellerMedicine.findFirst({
            where: {
                sellerId,
                medicineId: medicine.id,
            },
        });

        if (alreadyAdded) {
            throw new AppError(409, "Medicine already added by this seller");
            // return {
            //     success: false, 
            //     message: "Medicine already added by this seller"
            // }
        }

        // 5. create SellerMedicine (inventory)
        const sellerMedicine = await tx.sellerMedicine.create({
            data: {
                sellerId,
                medicineId: medicine.id,
                price: payload.price,
                stockQuantity: payload.stockQuantity ?? 0,
                batchNumber: payload.batchNumber,
                expiryDate: payload.expiryDate, // Date | undefined
                isAvailable: true,
            },
        });


        return {
            medicine,
            inventory: sellerMedicine,
        };
    });
};


const getAllMedicines = async () => {
    return prisma.medicine.findMany({
        include: {
            category: true,
            reviews: true,
            sellers: true,
        },
        orderBy: { name: "asc" },
    });
};

const getSingleMedicine = async (id: string) => {
    const medicine = await prisma.medicine.findUnique({
        where: { id },
        include: {
            category: true,
            reviews: true,
            sellers: true,
        },
    });

    if (!medicine) throw new AppError(404, "Medicine not found");
    return medicine;
};

const updateMedicine = async (
    medicineId: string,
    sellerId: string,
    payload: UpdateMedicinePayload
) => {
    // check medicine exists
    const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId },
    });

    if (!medicine) {
        throw new AppError(404, "Medicine not found");
    }

    // check seller owns this medicine
    const sellerMedicine = await prisma.sellerMedicine.findFirst({
        where: {
            medicineId,
            sellerId,
        },
    });

    if (!sellerMedicine) {
        throw new AppError(403, "You are not allowed to update this medicine");
    }

    // update medicine table (basic info)
    const medicineUpdateData = {
        name: payload.name,
        brandName: payload.brandName,
        genericName: payload.genericName,
        manufacturer: payload.manufacturer,
        description: payload.description,
    };

    await prisma.medicine.update({
        where: { id: medicineId },
        data: medicineUpdateData,
    });

    // update medicineSeller table (inventory info)
    const sellerUpdateData = {
        price: payload.price,
        stockQuantity: payload.stockQuantity,
        batchNumber: payload.batchNumber,
    };

    await prisma.sellerMedicine.update({
        where: { id: sellerMedicine.id },
        data: sellerUpdateData,
    });

    return await prisma.medicine.findUnique({
        where: { id: medicineId },
        include: {
            sellers: true,
            category: true,
        },
    });
};


const deleteMedicine = async (medicineId: string, userId: string) => {

    // const isOwner = await prisma.medicine.findUnique({
    //     where: {
    //         id: medicineId,
    //         userId,
    //     }
    // })

    // if (!isOwner) {
    //     return {
    //         success: false,
    //         message: "Medicine not found"
    //     }
    // }

    const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
    if (!medicine) throw new AppError(404, "Medicine not found");

    return prisma.medicine.delete({ where: { id: medicineId } });
};

export const medicineServices = {
    addMedicineWithInventory,
    getAllMedicines,
    getSingleMedicine,
    updateMedicine,
    deleteMedicine,
};
