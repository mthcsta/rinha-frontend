JSONThreeViewer.prototype.search = function (text) {
    console.log(this);
    const filterNode = (data, path) => {
        const found = [];
        for (let key in data) {
            if (key.indexOf(text) !== -1 || (typeof data[key] === 'string' && data[key].indexOf(text) !== -1)) {
                found.push({key, value: data[key], path: path.concat([key])});
            } else if (typeof data[key] === 'object' && data[key] !== null) {
                found.push(...filterNode(data[key], [...path, key]));
            }
        }
        return found;
    }

    return filterNode(this.data(), []);
};