import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, Injectable, inject } from '@angular/core';

let timeOuts: any[] =[]

export function createElement(type:any,cls='',dataset=[],data=null,onclickFun=null){
  let ele = document.createElement(type)
  if (cls) {ele.setAttribute('class',cls)}
  dataset.forEach((data, i) => {
    let item =Object.entries(data)[0];
    item[1]!==undefined?ele.setAttribute('data-'+item[0],item[1]):0;

  });
  data?ele.dataset['data']=JSON.stringify(data):0;
  if (onclickFun) {
    ele.addEventListener('click',function () {onclickFun})
    // =onclickFun
    // ele.setAttribute('onclick',onclickFun)
  }
  return ele;
}

 export function addHours(date:any,hours:any,action = "add") { if (action === 'remove') { date.setHours(date.getHours() - hours); } else { date.setHours(date.getHours() + hours); }; return date; }

 export function numberWithCommas(x:any,round=2){round!==undefined?x=parseFloat(x).toFixed(round):x=parseFloat(x);x =x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");return x}

 export async function copyContent(text:any,qm:any,show_message=true) {

   // let qm =inject(quickMessage)
   try {await navigator.clipboard.writeText(text);
     let message='Data successfully copied to clipboard';
     show_message?[
       qm.show(message)
     ]:0;
     // show_message?toastMess(message):0;
   } catch (err) {console.error('Failed to copy: ', err);}
 }

 function loadScript(scriptUrl: string): Promise<void> {
   return new Promise((resolve, reject) => {
     const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
     if (existingScript) {
       existingScript.remove();
     }

     const script = document.createElement('script');
     script.src = scriptUrl;
     script.type = 'text/javascript';
     script.async = true;
     script.onload = () => resolve();
     script.onerror = () => reject(new Error(`Script load error: ${scriptUrl}`));
     document.body.appendChild(script);
   });
 }

 export function loadExternalScript(URL='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'){

   setTimeout(() => {
     let element = document.querySelector('.goog-te-gadget-icon');
     console.log({element});
     if (!element) {
       loadScript(URL)
       .then(() => {
         console.log('Google Translate script loaded.');
         setTimeout(() => {
           changeGoogleIcon(document.querySelector('.goog-te-gadget-simple'))
         }, 3000)

       })
       .catch(err => {
         console.error('Script load error:', err);
       });
     }else{
       console.log('ELEMENT LOADED');
       changeGoogleIcon(document.querySelector('.goog-te-gadget-simple'))
     }
   }, 3000); // delay in milliseconds
 }

 function changeGoogleIcon(ele:any) {

   if (ele) {
     ele.querySelector('img').style=''
     ele.style='background:transparent;border:none !important;';
     ele.querySelector('img')?ele.querySelector('img').src='assets/images/icons8-world-40.png':0;
   }
 }

 @Injectable({
   providedIn: 'root'
 })
 export class quickMessage {

   constructor(

     private snackBar: MatSnackBar,
   ) {}

  show(message:any,duration=3000) {
     this.snackBar.open(message, '', {
      duration: duration, // duration in milliseconds
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

}

export function loadMore(e:any) {

  if (e.data) {

    const nextItems = e.data.slice(e.currentIndex, e.currentIndex + e.batchSize);
    e.displayedItems = [...e.displayedItems, ...nextItems];
    e.currentIndex += e.batchSize
    // console.log("displayedItems>>", e.displayedItems);
    // console.log("data>>", e.dta);

  }
}

export function onScroll(event: any,e:any) {
  const element = event.target;
  const threshold = 5;

  if (element.scrollHeight - element.scrollTop - element.clientHeight <= threshold) {
    loadMore(e);
  }
}

export function timeSince(dateStr: string): string {

  const date = new Date(dateStr);
  const seconds = Math.floor((+new Date() - +date) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (let key in intervals) {
    const interval = Math.floor(seconds / intervals[key]);
    if (interval >= 1) return `${interval} ${key}${interval > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}
