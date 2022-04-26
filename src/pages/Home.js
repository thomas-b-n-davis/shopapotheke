import React from "react";
import Spinner from '../components/Spinner';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            loading: false,
            errorMsg: "",
            filter: "all",
            normalFilterList: ["all", "starred"],
            starred: [],
            rating: [1, 2, 3, 4, 5],
            languages: []
        }
    }
    componentDidMount() {
        this.loadData();
        // let cached = JSON.parse(localStorage.getItem("items"));
        // var languages = cached.map(data => {
        //     if (data.language != null)
        //         return data.language;
        // });
        // languages = [...new Set(languages.map(item => item))];
        // this.setState({ list: cached, languages: languages });

        let starred = localStorage.getItem("starred");
        starred = (starred != null) ? JSON.parse(starred) : [];
        this.setState({ starred: starred });
    }

    loadData = async () => {
        var self = this;
        this.setState({ loading: true, errorMsg: "" });
        await fetch("https://api.github.com/search/repositories?q=created:>2017-01-10&sort=stars&order=desc")
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    return Promise.reject(response.json());
            })
            .then(result => {
                var languages = result.items.map(data => {
                    if (data.language != null)
                        return data.language;
                });
                languages = [...new Set(languages.map(item => item))];
                self.setState({ list: result.items, languages: languages });

                localStorage.setItem("items", JSON.stringify(result.items));
            }).catch(err => {
                err.then(error => {
                    self.setState({ errorMsg: error.message });
                });
            }).finally(() => {
                self.setState({ loading: false });
            });
    }


    starItem = (id, star) => {
        let starred = this.state.starred;
        if (starred.filter(data => (data.id == id)).length > 0) {
            starred = starred.filter(data => (data.id != id));
        }
        starred.push({ id: id, rating: star });
        localStorage.setItem("starred", JSON.stringify(starred));
        this.setState({ starred: starred });
    }


    render() {
        const { list, loading, errorMsg, starred, filter, rating, languages, normalFilterList } = this.state;
        let itemList = list;

        if (filter === "starred") {
            itemList = list.filter(data => (starred.filter(star => (star.id == data.id)).length > 0));
        } else if (filter !== "all" && filter !== "starred") {
            itemList = list.filter(data => (data.language == filter));
        }
        return (<>
            <div className="container">
                <div className="row">

                    <div className="col-12 header-label">
                        <h4 className="">List Of Repositories</h4>
                        <p>List of all reporisories</p>
                        <hr />
                    </div>
                    <div className="col-12">
                        {(loading == true) && <div className="col-12 text-center"><Spinner fill="#000" bg="#fff" /></div>}
                        {(errorMsg != "") && <div className="col-12 text-center"><small>{errorMsg}</small></div>}

                        <small>Normal Filters</small>
                        <div class="input-group mb-3 filters">
                            {normalFilterList.map(filters => <button class={(filter == filters) ? "btn btn-secondary" : "btn btn-outline-secondary"} type="button" onClick={() => this.setState({ filter: filters })}>{filters}</button>)}
                        </div>
                        <small>Language Filters</small>
                        {(languages.length > 0) &&
                            <div class="input-group mb-3 filters">
                                {languages.map(lang => <button class={(filter == lang) ? "btn btn-secondary" : "btn btn-outline-secondary"} type="button" onClick={() => this.setState({ filter: lang })}>{lang}</button>)}
                            </div>}
                        <table>
                            <thead>
                                <td>Name</td>
                                <td>Description</td>
                                <td>Rating</td>
                                <td>Link</td>
                                <td>Starring</td>
                            </thead>
                            {itemList.map(items => {
                                var rate = starred.filter(star => (star.id == items.id));
                                rate = (rate.length > 0) ? rate[0].rating : 0;
                                return <tr className="col-12 item-container">
                                    <td>{items.name}{JSON.stringify(rate)}</td>
                                    <td>{items.description}</td>
                                    <td>{items.stargazers_count}</td>
                                    <td><a href={items.url} target="_blank"><ion-icon name="link"></ion-icon></a></td>
                                    <td>{rating.map(stars => {
                                        return <button onClick={() => this.starItem(items.id, stars)}><ion-icon name={(rate >= stars) ? "star" : "star-outline"}></ion-icon></button>
                                    })}</td>
                                </tr>
                            })}
                        </table>
                    </div>
                </div>
            </div>
        </>);
    }
}