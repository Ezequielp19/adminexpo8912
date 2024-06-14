import { Component, OnInit, ViewChild } from '@angular/core';
import { FirestoreService } from '../../common/services/firestore.service';
import { Marca } from '../../common/models/marca.model';
import { AlertController, LoadingController, IonModal } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.scss'],
  standalone: true,
  imports: [IonModal, CommonModule, FormsModule, ReactiveFormsModule],
})
export class MarcasPage implements OnInit {
  marcas: Marca[] = [];
  nuevaMarca: Marca = { nombre: '', imagen: '' };
  imagenMarca: File | null = null;
  isModalOpen = false;

  marcaForm: FormGroup;

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private storage: AngularFireStorage
  ) {
    this.marcaForm = this.fb.group({
      nombre: ['', Validators.required],
      imagen: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.cargarMarcas();
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.agregarMarca();
    }
  }

  async cargarMarcas() {
    this.marcas = await this.firestoreService.getMarcas();
  }

  onFileSelected(event: any) {
    this.imagenMarca = event.target.files[0];
  }

  async agregarMarca() {
    if (this.marcaForm.invalid || !this.imagenMarca) {
      this.showErrorAlert('Por favor, completa todos los campos y selecciona una imagen.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando...',
    });
    await loading.present();

    try {
      const marcaData = this.marcaForm.value;
      
      // Subir la imagen a Firebase Storage
      const filePath = `marcas/${this.imagenMarca.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.imagenMarca);
      await task;
      const downloadURL = await fileRef.getDownloadURL().toPromise();

      marcaData.imagen = downloadURL; // Asignar la URL de la imagen a marcaData
      await this.firestoreService.addMarca(marcaData);
      this.showSuccessAlert('Marca agregada con éxito.');
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
    this.marcaForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;
    this.imagenMarca = null; // Limpia la selección de imagen al cerrar el modal
  }

  async eliminarMarca(marca: Marca) {
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
            try {
              await this.firestoreService.deleteMarca(marca);
              this.marcas = this.marcas.filter(m => m.id !== marca.id);
              this.showSuccessAlert('La marca se ha eliminado con éxito.');
            } catch (error) {
              console.error('Error eliminando la marca:', error);
              this.showErrorAlert('Error al eliminar la marca. Por favor, inténtalo de nuevo.');
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

