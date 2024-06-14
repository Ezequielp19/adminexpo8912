import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { FirestoreService } from '../../common/services/firestore.service';
import { Marca } from '../../common/models/marca.model';

@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.scss'],
})
export class MarcasPage implements OnInit {
  marcas: Marca[] = [];
  imagenMarca: File | null = null;
  isModalOpen: boolean = false;
  editMode: boolean = false;
  marcaForm: FormGroup;

  marcaAEditar: Marca | null = null;

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private fb: FormBuilder,
    private loadingController: LoadingController
  ) {
    this.marcaForm = this.fb.group({
      id: [''],
      nombre: ['', Validators.required],
      imagen: ['']
    });
  }

  ngOnInit() {
    this.cargarMarcas();
  }

  async cargarMarcas() {
    try {
      this.marcas = await this.firestoreService.getMarcas();
      console.log('Marcas obtenidas:', this.marcas);
    } catch (error) {
      console.error('Error obteniendo marcas:', error);
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
        await this.firestoreService.updateMarca(marcaData, this.imagenMarca);
      } else {
        await this.firestoreService.addMarca(marcaData, this.imagenMarca);
      }
      this.showSuccessAlert('Marca guardada con éxito.');
      this.cargarMarcas();
    } catch (error) {
      console.error('Error al guardar la marca:', error);
      this.showErrorAlert('Error al guardar la marca. Por favor, inténtalo de nuevo.');
    } finally {
      await loading.dismiss();
      this.closeModal();
    }
  }

  async eliminarMarca(marca: Marca) {
    if (!marca || !marca.id) {
      console.error('Marca inválida o sin ID.');
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
              await this.firestoreService.deleteMarca(marca);
              this.marcas = this.marcas.filter(m => m.id !== marca.id);
              console.log(`Marca eliminada: ${marca.id}`);
              this.showSuccessAlert('La marca se ha eliminado con éxito.');
            } catch (error) {
              console.error('Error eliminando la marca:', error);
              this.showErrorAlert('Error al eliminar la marca. Por favor, inténtalo de nuevo.');
            } finally {
              await loading.dismiss();
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

  openModal() {
    this.isModalOpen = true;
    this.editMode = false;
    this.marcaForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;
    this.imagenMarca = null;
  }

  onFileSelected(event: any) {
    this.imagenMarca = event.target.files[0];
  }
}
