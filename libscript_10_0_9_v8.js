const base = Process.findModuleByName("libil2cpp.so").base;   
 
const connectUsingSettings = base.add(0x11868D0);   
 
const string_new = new NativeFunction(Module.findExportByName("libil2cpp.so", "il2cpp_string_new"), "pointer", ["pointer"]);   
 
if (string_new.isNull()) {  
    console.error("Failed to find il2cpp_string_new function.");  
} else {  
    console.log("il2cpp_string_new function found at address: " + string_new);  
}  
 
Interceptor.attach(connectUsingSettings, {   
    onEnter: function(args) {   
        const AppSettingsInstance = args[0];   
         
        const newStringPointer = string_new(Memory.allocUtf8String("PHOTON_HERE")); //pun app
         
        const oldAppIdRealtime = AppSettingsInstance.add(0x10).readPointer();  
        const oldAppIdFusion = AppSettingsInstance.add(0x18).readPointer();  
         
           
        AppSettingsInstance.add(0x10).writePointer(newStringPointer);   
        AppSettingsInstance.add(0x18).writePointer(newStringPointer);   
 
        const emptyStringPointer = string_new(Memory.allocUtf8String(""));
 
        AppSettingsInstance.add(0x20).writePointer(emptyStringPointer);
        AppSettingsInstance.add(0x28).writePointer(emptyStringPointer); 
        AppSettingsInstance.add(0x30).writePointer(emptyStringPointer); 
        AppSettingsInstance.add(0x40).writePointer(emptyStringPointer); 
        AppSettingsInstance.add(0x48).writePointer(emptyStringPointer); 
        AppSettingsInstance.add(0x50).writePointer(emptyStringPointer); 
        AppSettingsInstance.add(0x58).writeInt(0);
        AppSettingsInstance.add(0x60).writePointer(emptyStringPointer); 
        AppSettingsInstance.add(0x68).writeInt(0);
        AppSettingsInstance.add(0x69).writeByte(0);
        AppSettingsInstance.add(0x6C).writeInt(0);
        AppSettingsInstance.add(0x70).writeByte(0);
        AppSettingsInstance.add(0x71).writeInt(0);
 
        const newAppIdRealtime = AppSettingsInstance.add(0x10).readPointer();  
        const newAppIdFusion = AppSettingsInstance.add(0x18).readPointer();  
  
        if (oldAppIdRealtime !== newAppIdRealtime || oldAppIdFusion !== newAppIdFusion) {  
            console.log("Successfully modified AppSettingsInstance. Old values: AppIdRealtime: " + oldAppIdRealtime + ", New value: " + newAppIdRealtime +  
                        "; AppIdFusion: " + oldAppIdFusion + ", New value: " + newAppIdFusion); 
        } else {  
            console.warn("Failed to modify AppSettingsInstance. Values did not change.");  
        }  
    },   
    onLeave: function(retval) {   
        console.log("[*] Function executed.");   
    }   
});