const il2cppBase = Process.findModuleByName("libil2cpp.so").base;
const loginAddr = il2cppBase.add(0xCAE6AC);
const setActiveAddr = il2cppBase.add(0x2397E08);
const connectUsingSettingsAddr = il2cppBase.add(0x1A51C2C);
const setActive = new NativeFunction(setActiveAddr, "void", ['pointer', 'bool']);
const il2cpp_string_new = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_string_new"),
    "pointer", ["pointer"]
);

Interceptor.attach(ptr(loginAddr), {
    onEnter: function(args) {
        var obj = args[0].add(0x58).readPointer();
        console.log(obj);
        this.obj = obj;
    },
    onLeave: function(retval) {
        setActive(this.obj, 1);
    }
});

Interceptor.attach(ptr(connectUsingSettingsAddr), {
    onEnter: function(args) {
        var appIdRealtime = args[0].add(0x10);
        var appIdVoice = args[0].add(0x28);
        appIdRealtime.writePointer(il2cpp_string_new(Memory.allocUtf8String("PHOTON_HERE"))); //pun app
        appIdVoice.writePointer(il2cpp_string_new(Memory.allocUtf8String("PHOTON_HERE"))); //voice app
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
