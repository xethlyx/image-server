const envSettings: {[variable: string]: any} = {
    ALLOWED_IPS: '127.0.0.1',
    DATABASE: 'sqlite::memory:',
    CLEANUP: '3600000,604800000'
}

export const validatedSettings = {
    ALLOWED_IPS: [] as Array<string>,
    DATABASE: '',
    CLEANUP: {
        interval: -1,
        maxAge: 0
    }
}

export function validate() {
    for (const envVar in envSettings) {
        if (process.env[envVar]) {
            envSettings[envVar] = process.env[envVar];
        }
    }

    const throwError = (type: string, message: string, fatal: boolean) => {
        console.warn(`#################################################################\n${type}\n\n${message}\n#################################################################`);
        if (fatal) process.exit(1);
    }

    if (!process.env.DATABASE) {
        throwError(
            'WARNING',
            'The environment variable "DATABASE" was not supplied! Falling back to redundant in-memory SQLite database. Changes will NOT be saved after a reboot.',
            false
        );
    }

    if (!process.env.ALLOWED_IPS) {
        throwError(
            'WARNING',
            'The environment variable "ALLOWED_IPS" was not supplied! You will not be able to upload from external sources.',
            false
        );
    }

    if (envSettings.CLEANUP != '-1') {
        const splitCleanup = (envSettings.CLEANUP as string).split(',');
        if (splitCleanup.length != 2) {
            throwError(
                'ERROR',
                'Environment variable "CLEANUP" does not have the right amount of values.',
                true
            );
        }
    
        for (const splitCleanupVar of splitCleanup) {
            if (!Number.isSafeInteger(Number(splitCleanupVar))) {
                throwError(
                    'ERROR',
                    'Value passed to environment variable "CLEANUP" was not an integer!',
                    true
                );
            }
    
            if (Number(splitCleanupVar) < 1) {
                throwError(
                    'ERROR',
                    'Value passed to environment variable "CLEANUP" was not a positive integer, and was not -1!',
                    true
                );
            }
        }

        
        validatedSettings.CLEANUP = {
            interval: Number(envSettings.CLEANUP.split(',')[0]),
            maxAge: Number(envSettings.CLEANUP.split(',')[1]),
        }
    }

    validatedSettings.ALLOWED_IPS = envSettings.ALLOWED_IPS.split(',');
    validatedSettings.DATABASE = envSettings.DATABASE;

    console.log('Your settings are: ' + JSON.stringify(validatedSettings));
}