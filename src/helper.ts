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

 export async function copyContent(text:any,show_message=true) {
   try {await navigator.clipboard.writeText(text);
     let message='Data successfully copied to clipboard';
     show_message?alert(message):0;
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
     const element = document.querySelector('.goog-te-gadget-icon');
     console.log({element});
     if (!element) {
       loadScript(URL)
       .then(() => {
         console.log('Google Translate script loaded.');
       })
       .catch(err => {
         console.error('Script load error:', err);
       });
     }
   }, 3000); // delay in milliseconds


 }
