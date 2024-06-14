import { DocumentReference } from '@angular/fire/firestore';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioFinal?: number; // Opcional si no hay descuento
  precioDistribuidor?: number; // Opcional si no hay precio especial
  etiqueta: string;
  categoria: DocumentReference; // Referencia a la categoría
  marca: DocumentReference;    // Referencia a la marca
  imagen: string;              // URL de la imagen
}
