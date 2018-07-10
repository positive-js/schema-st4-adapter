module.exports = {
    extends: ['@ptsecurity/commitlint-config'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                // as examples
                'app',
                'common'
            ]
        ]
    }
};
