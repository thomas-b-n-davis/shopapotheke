import React, { useState, useEffect } from "react";
import Spinner from '../components/Spinner';

export default function () {
    const endpoint = "https://api.github.com/search/repositories?q=created:>2017-01-10&sort=stars&order=desc";
    const rating = [1, 2, 3, 4, 5];
    const normalFilterList = ["all", "starred"];
    const [languages, setLanguages] = useState([]);
    const [starred, setStarred] = useState([]);
    const [list, setList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const loadLangs = () => {
        let starred = localStorage.getItem("starred");
        starred = (starred != null) ? JSON.parse(starred) : [];
        setStarred(starred);
    }

    const loadData = async () => {
        setLoading(true);
        setErrorMsg(errorMsg);
        await fetch(endpoint)
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
                setLanguages(languages);
                setList(result.items);
                setFilteredList(result.items);
                localStorage.setItem("items", JSON.stringify(result.items));
            }).catch(err => {
                err.then(error => {
                    setErrorMsg(error.message);
                });
            }).finally(() => {
                setLoading(false);
            });
    }


    const starItem = (id, star) => {
        console.log("Star Item", id, star);
        let currentStarred = starred;
        if (currentStarred.filter(data => (data.id == id)).length > 0) {
            console.log("found Star Item");
            currentStarred = currentStarred.filter(data => (data.id != id));
        }
        currentStarred.push({ id: id, rating: star });
        console.log("Push Star Item", currentStarred);
        localStorage.setItem("starred", JSON.stringify(currentStarred));
        setStarred(currentStarred);
    }


    //Load the data
    useState(() => {
        loadData();
    }, []);

    //Set lang when the list changes
    useState(() => {
        loadLangs();
    }, [list]);

    //filter the list and set the results into filteredList whenever the filter is changed
    const filtering = (selectedFilter) => {
        setFilter(selectedFilter);
        var itemList = list;
        if (selectedFilter === "starred") {
            itemList = list.filter(data => (starred.filter(star => (star.id == data.id)).length > 0));
        } else if (selectedFilter !== "all" && selectedFilter !== "starred") {
            itemList = list.filter(data => (data.language == selectedFilter));
        }
        setFilteredList(itemList);
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
                        {normalFilterList.map(filters => <button class={(filter == filters) ? "btn btn-secondary" : "btn btn-outline-secondary"} type="button" onClick={() => filtering(filters)}>{filters}</button>)}
                    </div>
                    <small>Language Filters</small>
                    {(languages.length > 0) &&
                        <div class="input-group mb-3 filters">
                            {languages.map(lang => <button class={(filter == lang) ? "btn btn-secondary" : "btn btn-outline-secondary"} type="button" onClick={() => filtering(lang)}>{lang}</button>)}
                        </div>}
                    <table width="100%">
                        <thead>
                            <tr>
                                <td>Name</td>
                                <td>Description</td>
                                <td>Rating</td>
                                <td>Link</td>
                                <td>Starring</td>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.map(items => {
                                var rate = starred.filter(star => (star.id == items.id));
                                rate = (rate.length > 0) ? rate[0].rating : 0;
                                return <tr className="col-12 item-container" key={items.name}>
                                    <td>{items.name}{JSON.stringify(rate)}</td>
                                    <td>{items.description}</td>
                                    <td>{items.stargazers_count}</td>
                                    <td><a href={items.url} target="_blank"><ion-icon name="link"></ion-icon></a></td>
                                    <td>{rating.map(stars => {
                                        return <button onClick={() => starItem(items.id, stars)}><ion-icon name={(rate >= stars) ? "star" : "star-outline"}></ion-icon></button>
                                    })}</td>
                                </tr>
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>);
}