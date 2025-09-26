const { default: SummaryApi } = require("../common");

const fetchCategoryWiseProduct = async (category) => {
  try {
    const response = await fetch(SummaryApi.categoryWiseProduct.url, {
      method: SummaryApi.categoryWiseProduct.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category }),
    });

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const dataResponse = await response.json();

    // Validar que el backend devolvió datos correctamente
    if (dataResponse.success && Array.isArray(dataResponse.data)) {
      return dataResponse.data;
    } else {
      console.warn("Respuesta inesperada:", dataResponse);
      return [];
    }
  } catch (error) {
    console.error("Error en fetchCategoryWiseProduct:", error);
    return [];
  }
};

export default fetchCategoryWiseProduct;
