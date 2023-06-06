const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        const success = true;

        if (success) {
            resolve('Operation completed successfully');
        } else {
            reject(new Error('Operation failed'));
        }
    }, 1000);
});

promise
    .then((result) => {
        console.log('Fulfilled:', result);
    })
    .catch((error) => {
        console.log('Rejected:', error);
    });
