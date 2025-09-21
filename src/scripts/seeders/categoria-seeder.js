import Categoria from "../../model/categoria.js";

const categoriasBase = [
    {
        nombre: "F. A. Q."
    },
    {
        nombre: "Soporte técnico"
    },
    {
        nombre: "Políticas de la empresa"
    }
];

const categoriaSeeder = async () => {
    try {
        const categorias = await Categoria.find({});
        if (categorias.length === 0) {
            console.log("📂 Seeding categorías...");

            // Insertar categorías base
            const categoriasInsertadas = await Categoria.insertMany(categoriasBase);
            console.log(`✅ ${categoriasInsertadas.length} categorías insertadas`);

            return categoriasInsertadas;
        }
        else {
            console.log("✅ Categorías ya existen");
            return categorias;
        }
    } catch (error) {
        console.error("❌ Error al insertar categorías:", error);
        throw error;
    }
};

export default categoriaSeeder;
