import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule,FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import {  LoadingController } from '@ionic/angular';
import { FirestoreService } from '../../common/services/firestore.service';
import { Marca } from '../../common/models/marca.model';
import { AlertController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

import {
  IonItem,
  IonButton,
  IonLabel,
  IonInput,
  IonContent,
  IonFooter,
  IonGrid,
  IonModal,
  IonRow,
  IonCol,
  IonCard,
  IonIcon,
  IonCardHeader,
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
    IonIcon,
    IonTitle,
    IonFooter,
    IonToolbar,
    IonItem,
    IonInput,
    IonModal,
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
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonSelectOption,
    IonSelect,
    IonButton],
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.scss'],
})
export class MarcasPage implements OnInit {
    marcas: Marca[] = [];
  nuevaMarca: Marca = { nombre: '', imagen: '' };
  imagenMarca: File | null = null;
   isModalOpen: boolean = false;
  editMode: boolean = false;
  marcaForm: FormGroup;

marcaAEditar: Marca | null = null;

  @ViewChild(IonModal) modal!: IonModal;




  constructor(
    private FirestoreService: FirestoreService,
    private alertController: AlertController,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.marcaForm = this.fb.group({
  id: [''],
  nombre: ['', Validators.required],
  imagen: ['']
});       }

  async ngOnInit() {
    // this.cargarMarcas();
     this.marcas = await this.FirestoreService.getMarcas();
  console.log('Marcas obtenidas:', this.marcas);
  }

   cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.nuevaMarca, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      // this.agregarMarca();
    }
  }

  async cargarMarcas() {
    this.marcas = await this.FirestoreService.getMarcas();
  }

  onFileSelected(event: any) {
    this.imagenMarca = event.target.files[0];
  }



   async agregarMarca(nombre: string, imagen: File) {
    const nuevaMarca: Marca = { nombre, imagen: '' };
    try {
      const marcaAgregada = await this.FirestoreService.addMarca(nuevaMarca, imagen);
      this.marcas.push(marcaAgregada);
      console.log('Marca agregada:', marcaAgregada);
    } catch (error) {
      console.error('Error agregando la marca:', error);
    }
  }




  async agregarOEditarMarca() {
    if (this.marcaForm.invalid) {
      return;
    }

    const marcaData = this.marcaForm.value;

    const loading = await this.loadingController.create({
      message: 'Guardando...',
    });
    await loading.present();

    try {
      if (this.editMode && this.marcaAEditar) {
        marcaData.id = this.marcaAEditar.id;
      } else {
        await this.FirestoreService.addMarca(marcaData, this.imagenMarca);
      }
      this.showSuccessAlert('Marca guardada con éxito.');
    } catch (error) {
      console.error('Error al guardar la marca:', error);
      this.showErrorAlert('Error al guardar la marca. Por favor, inténtalo de nuevo.');
    } finally {
      await loading.dismiss();
      this.closeModal();
      this.cargarMarcas();
    }
  }



   openModal() {
    this.isModalOpen = true;
    this.editMode = false;
    this.marcaForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;

    this.imagenMarca = null;
  }



async eliminarMarca(marca: Marca) {
    if (!marca) {
      console.error('La marca es null o undefined.');
      return;
    }

    console.log('Marca a eliminar:', marca);

    if (!marca.id) {
      console.error('El id de la marca es null o undefined.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar la marca "${marca.nombre}"? Esta acción no se puede deshacer.`,
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
              await this.FirestoreService.deleteMarca(marca);
              this.marcas = this.marcas.filter(m => m.id !== marca.id);
              console.log(`Marca eliminada: ${marca.id}`);
              this.showSuccessAlert('La marca se ha eliminado con éxito.');
              this.cargarMarcas();
            } catch (error) {
              console.error('Error eliminando la marca:', error);
              this.showErrorAlert('Error al eliminar la marca. Por favor, inténtalo de nuevo.');
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
