class Config {
    private static _instance: Config;

    public readonly production: boolean;
 
    public readonly api: {
        port: number
    };

    private constructor() {
        this.production = process.env.NODE_ENV === 'production';

        this.api = {
            port: Number(process.env.API_PORT)
        };
    }

    public static get instance(): Config {
        if (!Config._instance) {
            Config._instance = new Config();
        }

        return Config._instance;
    }
}


export default Config.instance;
