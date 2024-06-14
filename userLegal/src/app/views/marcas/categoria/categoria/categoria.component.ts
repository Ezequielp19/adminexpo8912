import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {   LoadingController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { FirestoreService } from '../../../../common/services/firestore.service';
import { Categoria } from '../../../../common/models/categoria.model';
import { AlertController } from '@ionic/angular';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  IonItem,
  IonButton,
  IonLabel,
  IonFooter,
  IonModal,
  IonInput,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonIcon,
  IonCardTitle,
  IonList,
  IonCardContent,
  IonToolbar,
  IonTitle,
  IonHeader, IonBackButton, IonButtons, IonSpinner, IonSelectOption, IonSelect, IonSearchbar, IonAvatar } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [ CommonModule, FormsModule, ReactiveFormsModule,IonAvatar, IonSearchbar, IonSpinner, IonButtons, IonBackButton,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
     IonIcon,
     IonFooter,
    IonInput,
    IonLabel,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonCardContent,
     IonModal,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonSelectOption,
    IonSelect,
    IonButton],
  selector: 'app-categorias',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss'],
})
export class CategoriasPage implements OnInit {
  categorias: Categoria[] = [];
     nuevaCategoria: Categoria = { nombre: '', imagen: '' };
  categoriaForm: FormGroup;
  isModalOpen: boolean = false;
  editMode: boolean = false;
  categoriaAEditar: Categoria | null = null;
  imagenCategoria: File | null = null;

   @ViewChild(IonModal) modal!: IonModal;

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.categoriaForm = this.fb.group({
      id: [''],
      nombre: ['', Validators.required],
      imagen: ['']
    });
  }

  async ngOnInit() {
    // this.cargarCategorias();
     this.categorias = await this.firestoreService.getCategorias();
    console.log('Categorías obtenidas en ngOnInit:', this.categorias);
  }

   cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.nuevaCategoria, 'confirm');
  }

   onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      // this.agregarCategoria();
    }
  }

  async cargarCategorias() {
    this.categorias = await this.firestoreService.getCategorias();
  }

  onFileSelected(event: any) {
    this.imagenCategoria = event.target.files[0];
  }

  async agregarCategoria(nombre: string, imagen: File) {
    const nuevaCategoria: Categoria = { nombre, imagen: '' };
    try {
      const categoriaAgregada = await this.firestoreService.addCategoria(nuevaCategoria, imagen);
      this.categorias.push(categoriaAgregada); // Asegurarse de que la categoría agregada tenga el id correcto
      console.log('Categoría agregada:', categoriaAgregada);
    } catch (error) {
      console.error('Error agregando la categoría:', error);
    }
  }

 async agregarOEditarCategoria() {
  if (this.categoriaForm.invalid) {
    return;
  }

  const categoriaData = this.categoriaForm.value;

  const loading = await this.loadingController.create({
    message: 'Guardando...',
  });
  await loading.present();

  try {
    if (this.editMode && this.categoriaAEditar) {
      categoriaData.id = this.categoriaAEditar.id;
      await this.firestoreService.updateCategoria(categoriaData, this.imagenCategoria);
    } else {
      await this.firestoreService.addCategoria(categoriaData, this.imagenCategoria);
    }
    this.showSuccessAlert('Categoría guardada con éxito.');
  } catch (error) {
    console.error('Error al guardar la categoría:', error);
    this.showErrorAlert('Error al guardar la categoría. Por favor, inténtalo de nuevo.');
  } finally {
    await loading.dismiss();
    this.closeModal();
    this.cargarCategorias();
  }
}


  openModal() {
    this.isModalOpen = true;
    this.editMode = false;
    this.categoriaForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;
    this.imagenCategoria = null;
  }

  async eliminarCategoria(categoria: Categoria) {
    if (!categoria) {
      console.error('La categoría es null o undefined.');
      return;
    }

    console.log('Categoría a eliminar:', categoria);

    if (!categoria.id) {
      console.error('El id de la categoría es null o undefined.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando...',
            });
            await loading.present();

            try {
              await this.firestoreService.deleteCategoria(categoria);
              this.categorias = this.categorias.filter(c => c.id !== categoria.id);
              console.log(`Categoría eliminada: ${categoria.id}`);
              this.showSuccessAlert('La categoría se ha eliminado con éxito.');
              this.cargarCategorias();
            } catch (error) {
              console.error('Error eliminando la categoría:', error);
              this.showErrorAlert('Error al eliminar la categoría. Por favor, inténtalo de nuevo.');
            } finally {
              await loading.dismiss();
              this.changeDetectorRef.detectChanges();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async showSuccessAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }





}
