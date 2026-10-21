const il2cppBase = Process.findModuleByName("libil2cpp.so").base;
const connectUsingSettingsAddr = il2cppBase.add(0x176B71C);
const unityWebRequestAddr = il2cppBase.add(0xAD60A8);
const il2cpp_string_new = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_string_new"),
    "pointer", ["pointer"]
);

Interceptor.attach(connectUsingSettingsAddr, {
    onEnter: function(args) {
        const appSettings = args[0];
        const newPhotonAppId = il2cpp_string_new(Memory.allocUtf8String("PHOTON_HERE")); //pun app
        const emptyString = il2cpp_string_new(Memory.allocUtf8String(""));
        appSettings.add(0x10).writePointer(newPhotonAppId);
        appSettings.add(0x18).writePointer(newPhotonAppId);
        appSettings.add(0x20).writePointer(emptyString);
        appSettings.add(0x28).writePointer(emptyString);
        appSettings.add(0x30).writePointer(emptyString);
        appSettings.add(0x40).writePointer(emptyString);
        appSettings.add(0x48).writePointer(emptyString);
        appSettings.add(0x50).writePointer(emptyString);
        appSettings.add(0x58).writeInt(0);
        appSettings.add(0x60).writePointer(emptyString);
        appSettings.add(0x68).writeInt(0);
        appSettings.add(0x69).writeByte(0);
        appSettings.add(0x6C).writeInt(0);
        appSettings.add(0x70).writeByte(0);
        appSettings.add(0x71).writeInt(0);
    },
    onLeave: function(retval) {}
});

Interceptor.attach(unityWebRequestAddr, {
    onEnter: function(args) {
        args[0].add(0x18).writePointer(
            il2cpp_string_new(Memory.allocUtf8String("https://pastebin.com/raw/id_pastebin")) //version url
        );
    },
    onLeave: function(retval) {}
});

Java.perform(function () {
    Java.scheduleOnMainThread(function() {
        for (let i = 0; i < 3; i++) {
            Java.use("android.widget.Toast")
                .makeText(
                    Java.use("android.app.ActivityThread").currentApplication().getApplicationContext(),
                    Java.use("java.lang.String").$new("your message"), //write you message 
                    1
                ).show();
        }
    });
});
