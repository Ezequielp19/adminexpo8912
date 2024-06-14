import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpClientModule } from '@angular/common/http';

import {
  IonItem,
  IonButton,
  IonLabel,
  IonInput,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonCardContent,
  IonToolbar,
  IonTitle,
  IonApp,
  IonIcon,
  IonHeader, IonBackButton, IonButtons, IonSpinner, IonSelectOption, IonSelect, IonSearchbar, IonAvatar } from '@ionic/angular/standalone';



import { ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
// import { IonModal, IonicModule } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

import { AlertController } from '@ionic/angular';
import { FormsModule, FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {  DocumentData } from '@angular/fire/compat/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import { Router, RouterLink } from '@angular/router';


@Component({
   standalone: true,
  imports: [ CommonModule, FormsModule, ReactiveFormsModule,HttpClientModule, RouterLink, IonAvatar, IonSearchbar, IonSpinner, IonButtons, IonBackButton,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
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
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonSelectOption,
    IonSelect,
    IonApp,
    IonButton, IonIcon],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
 clima: any = null; // Almacenar los datos del clima
  errorMensaje: string = ''; // Mensaje de error

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.obtenerClima();
  }

  obtenerClima() {
    navigator.geolocation.getCurrentPosition(
      (position) => this.obtenerClimaPorCoordenadas(position)
    );
  }

  obtenerClimaPorCoordenadas(position: GeolocationPosition) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = '91bfc66c11a449d5b69185401241306'; // Reemplaza con tu clave de WeatherAPI

    this.http.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`)
      .subscribe(
        (data: any) => {
          this.clima = data; // Almacenar los datos del clima
          this.errorMensaje = ''; // Limpiar el mensaje de error
        },
        (error) => {
          console.error("Error al obtener el clima:", error);
          this.errorMensaje = 'No se pudo obtener el clima. Inténtalo más tarde.';
          this.clima = null; // Limpiar los datos del clima en caso de error
        }
      );
  }
}
